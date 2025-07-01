'use client';
import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Page() {
  const [isObstacle, setob] = useState(false);
  useGSAP(() => {
    let t = gsap.timeline()
    t.from("#flex1 p",{
      delay:0.6,
      duration:0.7,
      y:"-300%",
      opacity:0,
      stagger:0.09,
      color:"white"
    })
    t.from("#flex2 p",{
      delay:-0.9,
      duration:0.7,
      x:"300%",
      opacity:0,
      stagger:0.09,
      color:"white"
    })
    t.from("#flex3",{
      duration:0.5,
      ease:"power4.in",
      x:"100%"
    })
    t.to("#cover",{
      opacity:0,
      duration:2,
      delay:0.4,
      
    })
    t.to("#cover",{
      
      zIndex:-3
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
      target.style.boxShadow = "inset 0px 0px 5px black";
      setob(true)
      mat[i][j] = -1;
    } else if (stat === 1 && src < 1 && target.style.backgroundColor !== "yellow" && target.style.backgroundColor !== "red") {
      target.style.backgroundColor = "blue";
      target.style.boxShadow = "inset 0px 0px 5px black";
      
      mat[i][j] = 1;
      setSx(i)
      setSy(j)
      setSrc(1);
      setStat(-1);
    } else if (stat === 2 && des < 1 && target.style.backgroundColor !== "yellow" && target.style.backgroundColor !== "blue") {
      target.style.backgroundColor = "red";
      target.style.boxShadow = "inset 0px 0px 5px black";
      
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

  function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
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
          let new_dis = dis + getDistance(i,j,x,y)
          if (matrix[x][y] !== -1 &&  new_dis< distance[x][y]) {
            distance[x][y] = new_dis;
            parent[x][y] = [i, j];
            heap.push([new_dis, x, y]);
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

    return animatePath(grid, trupath);



  }

  async function animatePath(grid, trupath) {
    let k = 0
    
    for (let i = 1; i < trupath.length - 1; i++) {
      
      const [a, b] = trupath[i];
      await new Promise(resolve => setTimeout(resolve, 100));
      k+=1
      setLen(k)
      grid[a][b].style.backgroundColor = "rgb(0, 255, 55)";
      grid[a][b].style.boxShadow = "inset 0px 0px 8px rgb(0, 0, 0)";

    }
    if (k>0){

      gsap.fromTo(".block",{
        borderColor:"rgb(141, 255, 166)",
        
      },{
        delay:0.4,
        duration:3,
        borderColor:"black",
        
      })
      
      
    }

    
    return k
    
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
  const [len,setLen] = useState(0)
  return (
    <>
      <div id="screen">Path length : {len}</div>
      <div id="cover">
        <div id="flex1">
          <p>S</p>
          <p>H</p>
          <p>O</p>
          <p>R</p>
          <p>T</p>
          <p>E</p>
          <p>S</p>
          <p>T</p>
        </div>

        <div id="flex2">
          <p>P</p>
          <p>A</p>
          <p>T</p>
          <p>H</p>
        </div>

        <div id="flex3">
          <p>F</p>
          <p>I</p>
          <p>N</p>
          <p>D</p>
          <p>E</p>
          <p>R</p>
        </div>
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
                grid[i][j].style.boxShadow = "none";
                // Reset all custom classes, preserve hover styling
                mat[i][j] = 0;

                
              }
            }
            setob(false)
            setLen(0)
            setSrc(0);
            setDes(0);
            setSx(-1);
            setSy(-1);
            setEx(-1);
            setEy(-1);
            setStat(-1);
            console.log(mat)
          }}

        >
          Reset 🔄
        </button>
        <button className="item" onClick={() => {
          setStat(0)
        }}>Add Obstacles <div id="obst"></div></button>
        <button className="item" onClick={() => {
          setStat(1)
        }}>Add Starting Point <div id="sta"></div></button>
        <button className="item" onClick={() => {
          setStat(2)
        }}>Add Destination <div id="end"></div></button>
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
      <button
  id="start"
  onClick={async () => {
    if (sx !== -1 && sy !== -1 && ex !== -1 && ey !== -1) {
      setLen(0);

      const temp = await dijkstraPrinting(gridRef.current, matRef.current, sx, sy, ex, ey);
      if (temp < 1) {
        toast("No valid Path...", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
          ease:"power3.out",
          type:"error",
          
          
          
        });
        
      gsap.fromTo(".block",{
        borderColor:"red"
      },{
        delay:0.4,
        duration:3,
        borderColor:"black"
      })
    
      }
      else{
        toast("Path found...", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
          ease:"power3.out",
          type:"success",
          
          
          
        })
        if (isObstacle == false){

          toast.info("Try adding obstacles next time...", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "colored",
            ease:"power3.out",
            
            
            
            
          })
        }
      }
    }
    else{
      toast.info("Select a starting point and a destination at least...", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
          ease:"power3.out",
          
          
          
          
        })
        gsap.fromTo(".block",{
        borderColor:"red"
      },{
        delay:0.4,
        duration:3,
        borderColor:"black"
      })
    }
  }}
>
  FIND SHORTEST PATH
</button>
<ToastContainer />

    </>
  )
}
export default Page