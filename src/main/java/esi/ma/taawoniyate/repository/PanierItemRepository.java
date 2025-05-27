package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.model.PanierItem;
import esi.ma.taawoniyate.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PanierItemRepository extends JpaRepository<PanierItem, Long> {
    PanierItem findByPanier(Panier panier);
    List<PanierItem> findAllBySeller(Seller seller);
}
