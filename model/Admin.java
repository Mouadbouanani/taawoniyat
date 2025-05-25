package esi.ma.taawoniyate.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
public class Admin extends User {


    public Admin() {
        super();
        this.setRole("admin");
    }

}
