package esi.ma.taawoniyate.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Client extends User {
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
            name = "users_produit_favoris",
            joinColumns = @JoinColumn(name = "client_id"),
            inverseJoinColumns = @JoinColumn(name = "produit_favoris_product_id")
    )
    public List<Product> produitFavoris;



    @OneToMany (mappedBy = "client", cascade = CascadeType.ALL)
    private List<Panier> paniers;




    public Client() {
        super();
        this.setRole("client");
    }

    public List<Product> getProduitFavoris() {
        return produitFavoris;
    }

    public void setProduitFavoris(List<Product> produitFavoris) {
        this.produitFavoris = produitFavoris;
    }
    public Client(long id, String fullName, String email, String region, String password, String city, String address, String phone, String role) {
        super(id, fullName, email, region, password, city, address, phone, role);
    }

    public List<Panier> getPaniers() {
        return paniers;
    }

    public void setPaniers(List<Panier> paniers) {
        this.paniers = paniers;
    }
}
