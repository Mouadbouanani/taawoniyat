package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.ProductImage;
import esi.ma.taawoniyate.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    // Find all images for a specific product by product ID
    List<ProductImage> findByProductId(int productId);

    // Find all images for a specific product
    List<ProductImage> findByProduct(Product product);
}