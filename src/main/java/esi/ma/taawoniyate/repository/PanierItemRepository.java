package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.model.PanierItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PanierItemRepository extends JpaRepository<PanierItem, Long> {
    PanierItem findByPanier(Panier panier);
}
