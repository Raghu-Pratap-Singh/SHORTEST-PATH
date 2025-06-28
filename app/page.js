'use client';
import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
function Page() {
  useGSAP(() => {
    let t = gsap.timeline()
    t.from("#cover h1", {
      y: 20,
      delay: 0.5,
      opacity: 0,
      duration: 1.4,
      stagger: -0.3
    })
    t.to("#cover", {
      delay: 1.7,
      duration: 2,
      opacity: 0,
      ease: "power3.out"
    })

    t.to("#cover", {
      delay: -0.8,
      zIndex: -2,
    })
  })
  const mapref = useRef();
  const [addf, setAddf] = useState(false);
  const [src, setSrc] = useState(0);
  const [des, setDes] = useState(0);

  const [sx, setSx] = useState(-1);
  const [sy, setSy] = useState(-1);
  const [ex, setEx] = useState(-1);
  const [ey, setEy] = useState(-1);

  const gridRef = useRef([]);

  const matRef = useRef(
    Array.from({ length: 20 }, () => Array(20).fill(0))
  );


  const [stat, setStat] = useState(-1);
  useEffect(() => {
    console.log(stat)
  }, [stat])

  function decide(target, i, j) {
    const mat = matRef.current;

    if (stat === 0 && target.style.backgroundColor !== "blue" && target.style.backgroundColor !== "red") {
      target.style.backgroundColor = "yellow";
      mat[i][j] = -1;
    } else if (stat === 1 && src < 1 && target.style.backgroundColor !== "yellow" && target.style.backgroundColor !== "red") {
      target.style.backgroundColor = "blue";
      mat[i][j] = 1;
      setSx(i)
      setSy(j)
      setSrc(1);
      setStat(-1);
    } else if (stat === 2 && des < 1 && target.style.backgroundColor !== "yellow" && target.style.backgroundColor !== "blue") {
      target.style.backgroundColor = "red";
      mat[i][j] = 2;
      setEx(i)
      setEy(j)
      setDes(1);
      setStat(-1);
    }

    console.log(mat);
  }


  // Set up grid
  useEffect(() => {
    if (mapref.current) {
      const arr = Array.from(mapref.current.children);
      const grid = gridRef.current;

      // Initialize grid array
      for (let i = 0; i < 20; i++) {
        grid.push([]);
      }

      let setter = 0;
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          grid[i].push(arr[setter]);
          setter++;
        }
      }

      console.log(grid);

      setAddf(true);
    }
  }, []);


  useEffect(() => {
    if (addf) {
      const grid = gridRef.current;

      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          grid[i][j].onclick = (e) => decide(e.target, i, j);

        }
      }
    }
  }, [addf, stat]);


  // HEAP CLASS
  class MinHeap {
    constructor() {
      this.heap = [];
    }

    // Insert a value
    push(value) {
      this.heap.push(value);
      this._heapifyUp(this.heap.length - 1);
    }

    // Remove and return the smallest value
    pop() {
      if (this.heap.length === 0) return undefined;
      if (this.heap.length === 1) return this.heap.pop();

      const min = this.heap[0];
      this.heap[0] = this.heap.pop();
      this._heapifyDown(0);
      return min;
    }

    // Return the smallest value without removing it
    peek() {
      return this.heap[0];
    }

    // Heap size
    size() {
      return this.heap.length;
    }

    // Internal helpers
    _heapifyUp(index) {
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        if (this.heap[index] >= this.heap[parentIndex]) break;
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      }
    }

    _heapifyDown(index) {
      const length = this.heap.length;
      while (true) {
        let smallest = index;
        const left = 2 * index + 1;
        const right = 2 * index + 2;

        if (left < length && this.heap[left] < this.heap[smallest]) smallest = left;
        if (right < length && this.heap[right] < this.heap[smallest]) smallest = right;
        if (smallest === index) break;

        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      }
    }
  }
  function dijkstraPrinting(grid, matrix, sx, sy, ex, ey) {
    const n = matrix.length;
    const distance = Array.from({ length: n }, () => Array(n).fill(1e9));
    const parent = Array.from({ length: n }, () => Array(n).fill(null));

    distance[sx][sy] = 0;

    const heap = new MinHeap(); // assumes MinHeap with push() and pop()
    heap.push([0, sx, sy]);

    while (heap.size() > 0) {
      const [dis, i, j] = heap.pop();

      if (dis > distance[i][j]) continue;

      const directions = [
        [i + 1, j],
        [i - 1, j],
        [i, j + 1],
        [i, j - 1],

        [i + 1, j + 1],
        [i - 1, j + 1],
        [i - 1, j - 1],
        [i + 1, j - 1]

      ];

      for (const [x, y] of directions) {
        if (x >= 0 && y >= 0 && x < n && y < n) {
          if (matrix[x][y] !== -1 && dis + 1 < distance[x][y]) {
            distance[x][y] = dis + 1;
            parent[x][y] = [i, j];
            heap.push([dis + 1, x, y]);
          }
        }
      }
    }

    // Reconstruct path
    const path = [];
    let [x, y] = [ex, ey];
    while (!(x === sx && y === sy)) {
      if (parent[x][y]) {
        path.push([x, y]);
        [x, y] = parent[x][y];
      } else {
        return -1; // no path found
      }
    }
    path.push([sx, sy]);
    const trupath = path.reverse();

    animatePath(grid, trupath);



  }

  async function animatePath(grid, trupath) {
    for (let i = 1; i < trupath.length - 1; i++) {
      const [a, b] = trupath[i];
      await new Promise(resolve => setTimeout(resolve, 100));
      grid[a][b].style.backgroundColor = "rgb(0, 255, 55)";
    }
  }

  function starter() {
    
      let t1 = gsap.timeline()
      t1.to("#instructions", {
        duration: 0.4,
        opacity: 0
      })
      t1.to("#instructions", {
        zIndex: -4
      })
    
  }
  // GIRD CREATED WHERE WE HAVE STORED REFERENCE TO EACH BLOCK IN TERMS OF ROW AND COL

  return (
    <>

      <div id="cover">
        <h1>SHORTEST</h1>
        <h1>PATH</h1>
        <h1>FINDER</h1>
      </div>
      <div id="instructions">
        <div className="i">
          <h1>STEP 1</h1>
          CLICK ON "Add Starting Point" AND THEN SELECT ANY GRID TO MARK THE STARTING POINT.
        </div>
        <div className="i">
          <h1>STEP 2</h1>
          CLICK ON "Add Destination" AND THEN SELECT ANY GRID TO MARK THE END DESTINATION.
        </div>
        <div className="i">
          <h1>STEP 3 (OPTIONAL)

          </h1>
          CLICK ON "Add Obstacles" AND THEN SELECT GRID SQUARES TO CREATE OBSTACLES
          ,(NOTE : THE PATH IS ALSO VALID FOR DIAGONAL MOVEMENT).
        </div>
        <div className="i">
          <h1>STEP 4</h1>
          FINALLY, CLICK ON "FIND SHORTEST PATH" TO GET THE SHORTEST PATH ON MAP, IF NO PATH IS POSSIBLE THEN NO OUTPUT WILL BE SHOWN.
        </div>
        <button id="confirm" onClick={starter}>Understood</button>
      </div>
      <div id="options">
        <button
          className="item"
          onClick={() => {
            const grid = gridRef.current;
            const mat = matRef.current
            for (let i = 0; i < 20; i++) {
              for (let j = 0; j < 20; j++) {

                grid[i][j].style.backgroundColor = "white"
                // Reset all custom classes, preserve hover styling
                mat[i][j] = 0;
              }
            }
            setSrc(0);
            setDes(0);
            setStat(-1);
          }}

        >
          Reset
        </button>
        <button className="item" onClick={() => {
          setStat(0)
        }}>Add Obstacles</button>
        <button className="item" onClick={() => {
          setStat(1)
        }}>Add Starting Point</button>
        <button className="item" onClick={() => {
          setStat(2)
        }}>Add Destination</button>
      </div>

      <div id="Container">
        <div id="MAP" ref={mapref}>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div><div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>




        </div>

      </div>
      <button id="start" onClick={() => {
        if (sx != -1 && sy != -1 && ex != -1 && ey != -1) {
          dijkstraPrinting(gridRef.current, matRef.current, sx, sy, ex, ey)
        }
      }}>FIND SHORTEST PATH</button>
    </>
  )
}
export default Page