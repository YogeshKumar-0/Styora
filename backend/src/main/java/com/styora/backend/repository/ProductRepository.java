package com.styora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styora.backend.entity.Product;

/**
 * 🎓 LESSON: Product Repository
 *
 * By extending JpaRepository, Spring automatically gives us methods like:
 * - findAll()
 * - findById()
 * - save()
 * - delete()
 *
 * We add findByCategory() ourselves, and Spring is smart enough to write the
 * SQL for us!
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
}
