package com.padel.api.repository;

import com.padel.api.model.CategoriaTorneo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaTorneoRepository extends JpaRepository<CategoriaTorneo, Long> {
    List<CategoriaTorneo> findByTorneoId(Long torneoId);
}
