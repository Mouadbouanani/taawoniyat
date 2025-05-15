package esi.ma.taawoniyate.model;

import jakarta.persistence.*;

import java.util.Date;
@Entity
public class Order {
    @Id
    @GeneratedValue(strategy  =  jakarta.persistence.GenerationType.IDENTITY)
    private int id;
    @ManyToOne
    private Client client;
    private Date date ;

    public Order(int id, Client client, Date date) {
        this.id = id;
        this.client = client;
        this.date = date;
    }

    public Order() {

    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
