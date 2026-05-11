# Use Java 17 to build and run the app
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy all backend files into the container
COPY . .

# Ensure the Maven wrapper is executable
RUN chmod +x mvnw

# Build the Spring Boot application
RUN ./mvnw clean package -DskipTests

# Run the compiled jar file with a strict memory limit for the free tier
CMD ["sh", "-c", "java -Xmx256m -jar target/*.jar"]