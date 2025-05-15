package esi.ma.taawoniyate.model;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.List;
@Entity
public class Customer extends User {
   private  List<Product> products;
    public Customer(int id, String fullName, String email, String phone, String region, String password, String city, String address) {
        super(id, fullName, email, phone, region, password, city, address);
    }

    public Customer() {

    }
    @OneToMany
    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}
