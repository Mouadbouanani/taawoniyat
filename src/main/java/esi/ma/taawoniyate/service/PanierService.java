package esi.ma.taawoniyate.service;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.repository.PanierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class PanierService {
    @Autowired
    PanierRepository panierRepository;

    public void savePanier(Panier panier){
        panierRepository.save(panier);
    }

    public List<Panier> getAllPanier(){
        return panierRepository.findAllWithItems();
    }

    public List<Panier> getAllPanierByClient(Client client) {
        return panierRepository.findAllByClient(client);
    }
}
