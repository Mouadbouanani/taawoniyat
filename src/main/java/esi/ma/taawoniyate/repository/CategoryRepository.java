package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;



import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Find a category by exact name
    Category findByName(String name);

    // Find all categories whose names contain a string (case insensitive)
    List<Category> findByNameContainingIgnoreCase(String keyword);
}
