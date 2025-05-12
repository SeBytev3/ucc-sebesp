#include <iostream>
#include <pqxx/pqxx>
#include <thread>
#include <chrono>
#include <cstdlib>
#include <ctime>
#include <csignal>

bool keep_running = true;

void signal_handler(int signal) {
    if (signal == SIGINT) {
        std::cout << "\nDeteniendo el cliente C++..." << std::endl;
        keep_running = false;
    }
}

int main() {

    std::cout << "Cliente C++ 📎 by Sebastian Espinosa B. 😎" << std::endl;

    // Registrar el manejador de señal para SIGINT
    std::signal(SIGINT, signal_handler);

    const std::string db_url = "postgresql://postgres:postgres@postgres-ppal:5432/postgres";
    std::srand(std::time(0));

    try {
        pqxx::connection conn(db_url);
        pqxx::work txn(conn);

        while (keep_running) {
            int wait_time = std::rand() % 10 + 1; // Espera aleatoria entre 1 y 10 segundos
            std::this_thread::sleep_for(std::chrono::seconds(wait_time));

            pqxx::result r = txn.exec("SELECT id, name FROM public.dummy");

            for (auto row : r) {
                std::cout << "C++ Resultado: " << row["id"].c_str() << " " << row["name"].c_str() << std::endl;
            }
        }

        // Limpiar la consola antes de terminar
        std::system("clear");
        std::cout << "El cliente C++ ha terminado." << std::endl;

    } catch (const std::exception &e) {
        std::cerr << e.what() << std::endl;
        return 1;
    }

    return 0;
}
