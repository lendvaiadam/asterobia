
    // === HOVER SYNC ===
    
    highlightQueueItem(index) {
        // UI Highlight
        const items = document.querySelectorAll('.command-item');
        items.forEach(item => item.classList.remove('highlighted'));
        
        const target = document.querySelector(`.command-item[data-index="${index}"]`);
        if (target) {
            target.classList.add('highlighted');
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Map Highlight
        this.highlightMapMarker(index);
    }
    
    highlightMapMarker(index) {
        if (!this.selectedUnit || !this.selectedUnit.waypointMarkers) return;
        
        this.selectedUnit.waypointMarkers.forEach((m, i) => {
            if (i === index) {
                m.scale.setScalar(1.5);
                m.material.opacity = 1.0;
            } else {
                m.scale.setScalar(1.0);
                m.material.opacity = 0.5;
            }
        });
    }
