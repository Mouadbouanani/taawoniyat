package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    User findByEmail(String email);
    User findByFullName(String fullName);
    User findById(long id);
    User findByCity(String city);
    User findByRegion(String region);
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.password = :password")
    Optional<User> findByEmailAndPassword(@Param("email") String email, @Param("password") String password);


    // More secure authentication - find by email only (for password verification in service)
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findUserForAuthentication(@Param("email") String email);
    default User authenticateUser(String email, String password) {
        Optional<User> user = this.findByEmailAndPassword(email, password);
        return user.orElse(null);
    }
}
