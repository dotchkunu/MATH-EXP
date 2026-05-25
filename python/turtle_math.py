"""
3D Turtle Mathematical Expressions Generator
Python version for generating mathematical curves
Can be used with matplotlib for visualization
"""

import math
import json

class Turtle3D:
    def __init__(self):
        self.x = 0
        self.y = 0
        self.z = 0
        self.angle_yaw = 0  # rotation around Y axis
        self.angle_pitch = 0  # rotation around X axis
        self.pen_down = True
        self.points = []
        self.current_path = []
        
    def forward(self, distance):
        """Move forward in current direction"""
        dx = distance * math.cos(self.angle_yaw) * math.cos(self.angle_pitch)
        dz = distance * math.sin(self.angle_yaw) * math.cos(self.angle_pitch)
        dy = distance * math.sin(self.angle_pitch)
        
        new_x = self.x + dx
        new_y = self.y + dy
        new_z = self.z + dz
        
        if self.pen_down:
            self.current_path.append((new_x, new_y, new_z))
        else:
            if self.current_path:
                self.points.append(self.current_path)
                self.current_path = []
            self.current_path = [(new_x, new_y, new_z)]
        
        self.x, self.y, self.z = new_x, new_y, new_z
        
    def rotate_yaw(self, degrees):
        """Rotate around Y axis (left/right)"""
        self.angle_yaw += math.radians(degrees)
        
    def rotate_pitch(self, degrees):
        """Rotate around X axis (up/down)"""
        self.angle_pitch += math.radians(degrees)
        
    def pen_up(self):
        """Lift pen (stop drawing)"""
        if self.pen_down:
            self.pen_down = False
            if self.current_path:
                self.points.append(self.current_path)
                self.current_path = []
                
    def pen_down(self):
        """Lower pen (start drawing)"""
        if not self.pen_down:
            self.pen_down = True
            self.current_path = [(self.x, self.y, self.z)]
            
    def reset(self):
        """Reset turtle to origin"""
        self.x, self.y, self.z = 0, 0, 0
        self.angle_yaw = 0
        self.angle_pitch = 0
        self.points = []
        self.current_path = []
        self.pen_down = True
        
    def get_points(self):
        """Get all drawn points"""
        if self.current_path:
            return self.points + [self.current_path]
        return self.points

# Mathematical curve generators
def generate_spiral(turtle, turns=4, radius=5, height=8):
    """Generate 3D spiral"""
    turtle.reset()
    turtle.pen_down()
    steps = 300
    for i in range(steps + 1):
        t = i / steps
        angle = t * 2 * math.pi * turns
        r = radius * t
        x = math.cos(angle) * r
        z = math.sin(angle) * r
        y = (t - 0.5) * height
        
        # Move to absolute position
        dx = x - turtle.x
        dy = y - turtle.y
        dz = z - turtle.z
        distance = math.sqrt(dx*dx + dy*dy + dz*dz)
        if distance > 0:
            turtle.forward(distance)

def generate_helix(turtle, radius=4, height=8, turns=4):
    """Generate helix curve"""
    turtle.reset()
    turtle.pen_down()
    steps = 400
    for i in range(steps + 1):
        t = i / steps
        angle = t * 2 * math.pi * turns
        x = radius * math.cos(angle)
        z = radius * math.sin(angle)
        y = (t - 0.5) * height
        
        dx = x - turtle.x
        dy = y - turtle.y
        dz = z - turtle.z
        distance = math.sqrt(dx*dx + dy*dy + dz*dz)
        if distance > 0:
            turtle.forward(distance)

def generate_rose_curve(turtle, k=5, radius=6):
    """Generate 3D rose curve"""
    turtle.reset()
    turtle.pen_down()
    steps = 500
    for i in range(steps + 1):
        t = i / steps * 2 * math.pi
        r = radius * math.cos(k * t)
        x = r * math.cos(t)
        z = r * math.sin(t)
        y = 3 * math.sin(t * 3)
        
        dx = x - turtle.x
        dy = y - turtle.y
        dz = z - turtle.z
        distance = math.sqrt(dx*dx + dy*dy + dz*dz)
        if distance > 0:
            turtle.forward(distance)

def generate_toroidal_spiral(turtle, R=5, r=2, turns=6):
    """Generate toroidal spiral"""
    turtle.reset()
    turtle.pen_down()
    steps = 600
    for i in range(steps + 1):
        t = i / steps
        angle = t * 2 * math.pi * turns
        x = (R + r * math.cos(angle * 2)) * math.cos(angle)
        z = (R + r * math.cos(angle * 2)) * math.sin(angle)
        y = r * math.sin(angle * 2) * 1.2
        
        dx = x - turtle.x
        dy = y - turtle.y
        dz = z - turtle.z
        distance = math.sqrt(dx*dx + dy*dy + dz*dz)
        if distance > 0:
            turtle.forward(distance)

def export_to_json(turtle, filename="turtle_output.json"):
    """Export generated points to JSON for visualization"""
    points_data = turtle.get_points()
    output = {
        "paths": points_data,
        "bounds": {
            "min_x": min([p[0] for path in points_data for p in path]),
            "max_x": max([p[0] for path in points_data for p in path]),
            "min_y": min([p[1] for path in points_data for p in path]),
            "max_y": max([p[1] for path in points_data for p in path]),
            "min_z": min([p[2] for path in points_data for p in path]),
            "max_z": max([p[2] for path in points_data for p in path])
        }
    }
    with open(filename, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"Exported to {filename}")

# Main execution
if __name__ == "__main__":
    turtle = Turtle3D()
    
    print("3D Turtle Mathematical Generator")
    print("Generating shapes...")
    
    # Generate different shapes
    print("1. Generating Spiral...")
    generate_spiral(turtle)
    export_to_json(turtle, "spiral_output.json")
    
    print("2. Generating Helix...")
    generate_helix(turtle)
    export_to_json(turtle, "helix_output.json")
    
    print("3. Generating Rose Curve...")
    generate_rose_curve(turtle)
    export_to_json(turtle, "rose_output.json")
    
    print("4. Generating Toroidal Spiral...")
    generate_toroidal_spiral(turtle)
    export_to_json(turtle, "toroidal_output.json")
    
    print("Done! Check the JSON files for point data.")