package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
    User findByEmail(String email);
    User findByFullName(String fullName);
    User findById(long id);
    User findByCity(String city);
    User findByRegion(String region);
}
