package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.service.ClientService;
import esi.ma.taawoniyate.service.PanierService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/panier")
public class PanierController {
    @Autowired
    PanierService panierService;
    @Autowired
    ClientService clientService;

    @PostMapping("/save")
    public ResponseEntity<String> savePanier(@RequestBody Panier panier, HttpSession session) {
        Client currentUser = (Client) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body("User not logged in");
        }
        panier.setClient(currentUser);
        panierService.savePanier(panier);
        return ResponseEntity.ok("Panier enregistré avec succès !");
    }

    @GetMapping("/history")
    public List<Panier> getPaniers(HttpSession session) {
        Client currentUser = (Client) session.getAttribute("user");
        if (currentUser == null) {
            return List.of();
        }
        return panierService.getAllPanierByClient(currentUser);
    }
}
