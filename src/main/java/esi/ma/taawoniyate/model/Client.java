package esi.ma.taawoniyate.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Client extends User {
    @OneToMany
    public List<Product> produitFavoris;

    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL)
    private Panier panier;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<PanierItem> panierItems;

    public Client() {
        super();
        this.setRole("client");
    }

    public Client(String fullName, String email, String region, String password, String city, String address, String phone) {
        super(fullName, email, region, password, city, address, phone, "client");
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

    public List<PanierItem> getPanierItems() {
        return panierItems;
    }

    public void setPanierItems(List<PanierItem> panierItems) {
        this.panierItems = panierItems;
    }
}
