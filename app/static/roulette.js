// Roulette wheel animation and drawing
class RouletteWheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.restaurants = [];
        this.rotation = 0;
        this.spinSpeed = 0;
        this.isSpinning = false;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'
        ];
    }
    
    setRestaurants(restaurants) {
        this.restaurants = restaurants;
        this.draw();
    }
    
    draw() {
        if (this.restaurants.length === 0) {
            this.ctx.fillStyle = '#ccc';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const sliceAngle = (2 * Math.PI) / this.restaurants.length;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw slices
        this.restaurants.forEach((restaurant, i) => {
            const startAngle = i * sliceAngle + this.rotation;
            const endAngle = startAngle + sliceAngle;
            
            // Draw slice
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.fill();
            
            // Draw border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw text
            const textAngle = startAngle + sliceAngle / 2;
            const textX = centerX + Math.cos(textAngle) * (radius * 0.65);
            const textY = centerY + Math.sin(textAngle) * (radius * 0.65);
            
            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const text = restaurant.name.substring(0, 15);
            this.ctx.fillText(text, 0, 0);
            this.ctx.restore();
        });
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    spin(duration = 5000, targetRestaurantId = null, callback = null) {
        if (this.isSpinning) return;
        this.isSpinning = true;
        
        const spins = 5; // number of full rotations
        const startRotation = this.rotation;
        
        // Calculate target rotation to land on specific restaurant or random
        let endRotation = startRotation + spins * 2 * Math.PI;
        if (targetRestaurantId !== null && this.restaurants.length > 0) {
            // Find the restaurant by ID in the current list
            const targetIndex = this.restaurants.findIndex(r => r.id === targetRestaurantId);
            if (targetIndex !== -1) {
                const sliceAngle = (2 * Math.PI) / this.restaurants.length;
                // We want the middle of the target slice to line up with the pointer at the top of
                // the wheel. The pointer sits at -90° (-Math.PI/2) relative to the canvas coordinate
                // system. Calculate the required rotation offset accordingly.
                const targetAngle = -Math.PI / 2 - (targetIndex + 0.5) * sliceAngle;
                endRotation = startRotation + spins * 2 * Math.PI + targetAngle;
            }
        } else {
            endRotation += Math.random() * Math.PI / 2;
        }
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            this.rotation = startRotation + (endRotation - startRotation) * easedProgress;
            this.draw();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                if (callback) callback();
            }
        };
        
        animate();
    }
    
    stop(callback = null) {
        if (!this.isSpinning) return;
        
        // Stop immediately with current rotation
        const elapsed = Date.now();
        this.isSpinning = false;
        this.draw();
        
        if (callback) callback();
    }
}
