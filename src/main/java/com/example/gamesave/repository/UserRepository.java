package com.example.gamesave.repository;

import  com.example.gamesave.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    User getUserByUsername(String username);

    User getUserById(Long id);
}
