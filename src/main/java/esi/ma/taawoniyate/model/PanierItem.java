package esi.ma.taawoniyate.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

@Entity
@Table(name = "panier_item")
public class PanierItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "panier_id")
    private Panier panier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="client_id", nullable=false)
    private Client client;

    public PanierItem() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    @JsonIgnore
    public String getPanier() {
        return String.valueOf(panier.getPanier_id());
    }

    public void setPanier(Panier panier) {
        this.panier = panier;
    }

    public String getProduct() {
        return product != null ? product.getName() : null;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSeller() {
        return seller != null ? seller.getBusinessName() : null;
    }

    @JsonIgnore
    public Seller getSellerEntity() {
        return seller;
    }

    public void setSeller(Seller seller) {
        this.seller = seller;
    }

    @JsonIgnore
    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }
}