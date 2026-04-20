import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

class UploadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.ensureDirExists();
  }

  private async ensureDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save an uploaded file to the local directory and update the database.
   */
  async uploadPortfolioImage(providerId: string, file: Express.Multer.File, caption?: string) {
    // Check provider profile exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { portfolio: true },
    });

    if (!provider) {
      throw new Error('Provider profile not found');
    }

    // Limit check (e.g., 10 images)
    if (provider.portfolio.length >= 10) {
      throw new Error('Portfolio limit reached (max 10 images)');
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    // Construct public URL (relative for flexibility)
    const imageUrl = `/uploads/${fileName}`;

    // Create record in database
    return prisma.providerPortfolio.create({
      data: {
        providerId,
        imageUrl,
        caption,
        displayOrder: provider.portfolio.length,
      },
    });
  }

  /**
   * Delete a portfolio image from the directory and the database.
   */
  async deletePortfolioImage(imageId: string, providerId: string) {
    const portfolioItem = await prisma.providerPortfolio.findFirst({
      where: { id: imageId, providerId },
    });

    if (!portfolioItem) {
      throw new Error('Image not found in your portfolio');
    }

    // Delete database record first
    await prisma.providerPortfolio.delete({
      where: { id: imageId },
    });

    // Extract filename from URL (assuming /uploads/filename)
    const fileName = path.basename(portfolioItem.imageUrl);
    const filePath = path.join(this.uploadDir, fileName);

    // Delete file from disk (silently fail if not found)
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file from disk:', err);
    }

    return true;
  }
}

export const uploadService = new UploadService();
