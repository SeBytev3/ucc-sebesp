Este readme proporciona una visión general del repositorio, destacando las tecnologías utilizadas y las funcionalidades principales. **No son instrucciones.** Todo este repositorio está realizado en **Ubuntu WSL**.

---

# UCC-SebEsp

Repositorio de ejemplos, ejercicios, mini-proyectos y proyectos finales de diferentes cursos de Ingeniería de Sistemas, desarrollado en la Universidad Cooperativa de Colombia (UCC). Este repositorio implementa arquitecturas de microservicios utilizando múltiples lenguajes de programación y herramientas de integración y despliegue continuo.

## Tabla de Contenidos

* [Tecnologías Utilizadas](#tecnologías-utilizadas)
* [Estructura del Proyecto](#estructura-del-proyecto)
* [Instalación y Ejecución](#instalación-y-ejecución)
* [Autores](#autores)
* [Licencia](#licencia)

## Tecnologías Utilizadas

* **Lenguajes de Programación:**

  * Java
  * Python
  * C++

* **Contenedores y Orquestación:**

  * Docker
  * Docker Compose
  * Kubernetes

* **ETL y Bases de Datos:**

  * Pentaho Data Integration (Kettle)
  * PostgreSQL
  * Oracle

* **Herramientas Adicionales:**

  * DBeaver
  * Scripts Bash para automatización

## Estructura del Proyecto

```
├── app-cliente-c++/           # Cliente desarrollado en C++
├── app-cliente-java/          # Cliente desarrollado en Java
├── app-cliente-python/        # Cliente desarrollado en Python
├── docker/                    # Archivos Dockerfile para cada servicio
├── docker-compose/            # Archivos docker-compose para orquestación
├── kubernetes/                # Manifiestos de Kubernetes
├── etls/                      # Transformaciones ETL con Pentaho
├── data/                      # Scripts y archivos de base de datos
├── Scripts/                   # Scripts Bash para automatización
├── .dbeaver/                  # Configuraciones de DBeaver (Puedes ignorarlos 🤷‍♂️)
├── run-docker-python.sh       # Script para ejecutar contenedor Python
├── run-image-python.sh        # Script para construir imagen Docker de Python
├── Transformation-pg-a-orcl.ktr # Transformación ETL de PostgreSQL a Oracle
└── ...
```

## Instalación y Ejecución

### Prerrequisitos

* Docker y Docker Compose instalados
* Kubernetes y kubectl configurados
* Pentaho Data Integration (Kettle) instalado
* Java, Python y compilador de C++ disponibles

### Pasos Generales

A. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/SeBytev3/ucc-sidi-sebesp.git
   cd ucc-sidi-sebesp
   ```

B. **Construir y ejecutar los contenedores:**

   ```bash
   cd docker-compose
   docker-compose up --build (sube el contenedor junto con los servicios y parametros)
   docker-compose down -v (baja el contenedor compose junto con los volúmenes)
   ```

C. **Ejecutar transformaciones ETL:**

   Abrir Pentaho Data Integration y cargar el archivo `Transformation-pg-a-orcl.ktr` ubicado en la raíz del proyecto.

D. **Desplegar en Kubernetes:**

   ```bash
   cd kubernetes
   kubectl apply -f .
   ```

## Autores

* [SeBytev3](https://github.com/SeBytev3)

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## Tecnologías y Licencias de Terceros

Este proyecto hace uso de las siguientes tecnologías de terceros:

- [Python](https://www.python.org/) – Licencia PSF
- [Java](https://www.oracle.com/java/) – Licencia GPLv2 con Classpath Exception
- [C++ (g++)](https://gcc.gnu.org/) – Licencia GPLv3
- [PostgreSQL](https://www.postgresql.org/) – Licencia PostgreSQL (similar a MIT)
- [Docker](https://www.docker.com/) – Licencia Apache 2.0
- [Kubernetes](https://kubernetes.io/) – Licencia Apache 2.0
- [Minikube](https://minikube.sigs.k8s.io/) – Licencia Apache 2.0
- [Alpine Linux](https://alpinelinux.org/) – Licencia MIT
- [Ubuntu](https://ubuntu.com/) – Licencia GPLv2 / Canonical
- [Pentaho Data Integration](https://pentaho.com/pentaho-developer-edition/) – Business Source License (BSL)
