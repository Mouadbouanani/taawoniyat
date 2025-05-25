package esi.ma.taawoniyate.repository;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PanierRepository extends JpaRepository<Panier, Integer> {
    Panier findByClient(Client client);
    List<Panier> findAllByClient(Client client);
    
    @Query("SELECT DISTINCT p FROM Panier p LEFT JOIN FETCH p.items i LEFT JOIN FETCH i.product LEFT JOIN FETCH i.seller")
    List<Panier> findAllWithItems();

}
