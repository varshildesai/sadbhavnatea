from PIL import Image
import sys

# Increase recursion depth in case BFS goes deep (though we use a queue)
sys.setrecursionlimit(2000000)

def main():
    path = r"D:\SADBHAVNATEA\client\public\logo2-0-transparent.png"
    out_path = r"D:\SADBHAVNATEA\client\public\logo2-0-transparent.png"
    
    img = Image.open(path).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    
    # Boolean array to keep track of visited pixels
    visited = [[False]*h for _ in range(w)]
    
    components = []
    
    for x in range(w):
        for y in range(h):
            if not visited[x][y]:
                r, g, b, a = pixels[x, y]
                if a > 0:
                    # Start BFS
                    queue = [(x, y)]
                    visited[x][y] = True
                    comp_pixels = []
                    
                    # BFS
                    idx = 0
                    while idx < len(queue):
                        cx, cy = queue[idx]
                        idx += 1
                        comp_pixels.append((cx, cy))
                        
                        # Add neighbors
                        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (1,1), (-1,1), (1,-1)]:
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < w and 0 <= ny < h:
                                if not visited[nx][ny]:
                                    visited[nx][ny] = True
                                    nr, ng, nb, na = pixels[nx, ny]
                                    if na > 0:
                                        queue.append((nx, ny))
                    
                    components.append(comp_pixels)
                else:
                    visited[x][y] = True

    if not components:
        print("No non-transparent pixels found!")
        return

    # Find the largest component (the main logo)
    components.sort(key=len, reverse=True)
    main_logo = components[0]
    
    print(f"Found {len(components)} components. Main logo has {len(main_logo)} pixels.")
    
    # Erase all smaller components!
    for comp in components[1:]:
        # If the component is significantly smaller, it's a spark
        if len(comp) < 1500:
            for px, py in comp:
                pixels[px, py] = (0, 0, 0, 0)
                
    img.save(out_path)
    print("Done removing sparks and watermarks!")

if __name__ == "__main__":
    main()
