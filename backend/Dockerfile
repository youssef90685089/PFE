# Multi-stage build for Spring Boot backend
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 as builder

WORKDIR /build
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests -q

# Stage 2: Runtime
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Install tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy built JAR
COPY --from=builder /build/target/sipms-*.jar app.jar

# Create upload directory
RUN mkdir -p /app/uploads

# Non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run application
CMD ["java", "-jar", "app.jar"]
