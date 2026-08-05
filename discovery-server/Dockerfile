FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven

# Root reactor pom + every module's pom.xml are needed for Maven to resolve
# the parent (agrosamridhi-parent) and initialize the multi-module reactor.
COPY pom.xml .
COPY discovery-server/pom.xml discovery-server/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY data-ingestion-service/pom.xml data-ingestion-service/pom.xml
COPY ai-inference-service/pom.xml ai-inference-service/pom.xml
COPY dashboard-aggregator-service/pom.xml dashboard-aggregator-service/pom.xml

COPY discovery-server/src discovery-server/src
RUN mvn -pl discovery-server -am clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/discovery-server/target/discovery-server-0.0.1-SNAPSHOT.jar app.jar
RUN chown -R app:app /app
USER app
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
