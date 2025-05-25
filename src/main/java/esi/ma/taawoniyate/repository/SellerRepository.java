package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerRepository extends JpaRepository<Seller, Integer> {
    Seller findByFullName(String fullName);
    Seller findByBusinessName(String businessName);
}
