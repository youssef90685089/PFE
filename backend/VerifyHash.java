import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class VerifyHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "Admin@123";
        
        // These are the two hashes we've seen
        String hash1 = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S"; // In DB
        String hash2 = "$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW"; // In seed data
        
        System.out.println("Password: " + password);
        System.out.println("\nHash 1 (current in DB):");
        System.out.println("  Hash: " + hash1);
        System.out.println("  Matches: " + encoder.matches(password, hash1));
        
        System.out.println("\nHash 2 (seed data):");
        System.out.println("  Hash: " + hash2);
        System.out.println("  Matches: " + encoder.matches(password, hash2));
        
        System.out.println("\nGenerating new hash:");
        String newHash = encoder.encode(password);
        System.out.println("  New hash: " + newHash);
        System.out.println("  Verifies: " + encoder.matches(password, newHash));
    }
}
