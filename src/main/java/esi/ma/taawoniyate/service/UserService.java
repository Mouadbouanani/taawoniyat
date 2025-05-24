package esi.ma.taawoniyate.service;

import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Cacheable(value = "users", key = "#email")
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Cacheable(value = "users", key = "#id")
    public User findById(long id) {
        return userRepository.findById(id);
    }

    @Cacheable(value = "users", key = "#fullName")
    public User findByFullName(String fullName) {
        return userRepository.findByFullName(fullName);
    }

    public List<User> findByCity(String city) {
        return List.of(userRepository.findByCity(city));
    }

    public List<User> findByRegion(String region) {
        return List.of(userRepository.findByRegion(region));
    }

    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email) != null;
    }

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }
}