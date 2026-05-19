package com.project.sipms.repository;

import com.project.sipms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Fetch ALL users with their roles in a single JOIN FETCH query.
     * Eliminates the N+1 problem caused by EAGER role loading.
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles")
    List<User> findAllWithRoles();

    /**
     * Fetch only users that have a specific role — single query, no N+1.
     * Used by ReceptionPanel to load candidates only (avoids returning all users).
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
}
