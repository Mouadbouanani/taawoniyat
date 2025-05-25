package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Category;
import esi.ma.taawoniyate.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    // Find products by category object
    List<Product> findByCategory(Category categorie);

    // Find products by category name (indirect search)
    List<Product> findByCategoryName(String name);

    // Find products by exact name
    List<Product> findByName(String name);

    // Find products by name (contains, case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Find by price range
    List<Product> findByPriceBetween(double minPrice, double maxPrice);

    // Find products by seller
    List<Product> findBySeller(Seller seller);

}
