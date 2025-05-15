package esi.ma.taawoniyate.model;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Entity
public class Client extends User {
    @OneToMany
    public List<Product> produitFavoris;
    @OneToOne
    private  Panier panier;

    public Client() {}

    public Client(int id, String fullName, String email, String phone, String region, String password, String city, String address) {
        super(id, fullName, email, phone, region, password, city, address);
        this.produitFavoris = produitFavoris;
        this.panier = panier;
    }

    public List<Product> getProduitFavoris() {
        return produitFavoris;
    }

    public void setProduitFavoris(List<Product> produitFavoris) {
        this.produitFavoris = produitFavoris;
    }

    public Panier getPanier() {
        return panier;
    }

    public void setPanier(Panier panier) {
        this.panier = panier;
    }
}
