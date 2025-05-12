FROM alpine:latest
WORKDIR /app
RUN apk update && \
    apk add --no-cache g++ make cmake postgresql-dev curl
RUN curl -L https://github.com/jtv/libpqxx/archive/7.6.0.tar.gz | tar xz && \
    cd libpqxx-7.6.0 && \
    cmake -DCMAKE_INSTALL_PREFIX=/usr . && \
    make && make install && \
    cd .. && rm -rf libpqxx-7.6.0 \
    rm 7.6.0.tar.gz
COPY src/main.cpp /app
RUN g++ -o application main.cpp -lpqxx -lpq
CMD ["./application"]