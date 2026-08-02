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

COPY api-gateway/src api-gateway/src
RUN mvn -pl api-gateway -am clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
