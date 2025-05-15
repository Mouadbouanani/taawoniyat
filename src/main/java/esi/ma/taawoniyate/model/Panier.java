package esi.ma.taawoniyate.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.util.HashMap;
import java.util.Map;
@Entity
public class Panier {
    @Id
    @GeneratedValue(strategy  =  jakarta.persistence.GenerationType.IDENTITY)
    private int id;
    @Column(name = "products")
    @Type(type = "esi.ma.taawoniyate.model.Products")
    private  Map<Product,Integer> products;

    public Panier() {
        this.products = new HashMap<>();
    }

    public Panier( Map<Product, Integer> products) {
        this.products = products;
    }

    public Map<Product, Integer> getProducts() {
        return products;
    }

    public void setProducts(Map<Product, Integer> products) {
        this.products = products;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
//    public void addProduct(Product prod ){
//
//    }
//    public void deleteProduct(Product prod){
//
//    }
//}
