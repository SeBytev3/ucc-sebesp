package co.edu.ucc.sd;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.concurrent.TimeUnit;

public class RandomQueryApp {

    private static final String DB_URL = "jdbc:postgresql://db-pg-ppal:5432/proyectofppal";
    private static final String USER = "postgres";
    private static final String PASS = "postgres";

    public static void main(String[] args) {
        System.out.println("Cliente Java 🍵 by Sebastian Espinosa B. 😎");
        try {
            Connection connection = DriverManager.getConnection(DB_URL, USER, PASS);
            Statement statement = connection.createStatement();

            while (true) {
                TimeUnit.SECONDS.sleep(40); // Espera fija de 40 segundos

                String query = "SELECT Codigo, Tipo_de_Vehiculo FROM Tabla1";
                ResultSet resultSet = statement.executeQuery(query);
                int count = 0;

                while (resultSet.next() && count < 5) { // Limitar a 5 resultados
                    System.out.println("Java Resultado: " + resultSet.getString("Codigo") + " " + resultSet.getString("Tipo_de_Vehiculo"));
                    count++;
                }

                if (count == 0) {
                    System.out.println("No se encontraron resultados.");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
