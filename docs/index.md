[![Build Status](https://travis-ci.org/LokiJS-Forge/LokiDB.svg?branch=master)](https://travis-ci.org/LokiJS-Forge/LokiDB)
[![Coverage Status](https://coveralls.io/repos/github/LokiJS-Forge/LokiDB/badge.svg?branch=master)](https://coveralls.io/github/LokiJS-Forge/LokiDB?branch=master)

# Welcome to LokiDB

<div id="container" style="width:800px;height:600px;border:1px solid grey"> </div>

<script>
setTimeout(() => {
require([
		'vs/language/typescript/monaco.contribution'
	], function() {


		// compiler options
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.UMD,
            noEmit: false,
            typeRoots: ["node_modules/@types"]
        });

		// extra libraries
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            'export function next() : string { console.log("wow!")',
            'node_modules/@types/external/index.d.ts');

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false
        });
  var editor = monaco.editor.create(document.getElementById('container'), {
			model: monaco.editor.createModel([
			    'import * as x from "external"',
                'const tt : string = x.next()',
				'',
				'/* Game of Life',
				' * Implemented in TypeScript',
				' * To learn more about TypeScript, please visit http://www.typescriptlang.org/',
				' */',
				'console.log("aha")',
				'module Conway {',
				'',
				'	export class Cell {',
				'		public row: number;',
				'		public col: number;',
				'		public live: boolean;',
				'',
				'		constructor(row: number, col: number, live: boolean) {',
				'			this.row = row;',
				'			this.col = col;',
				'			this.live = live',
				'		}',
				'	}',
				'',
				'	export class GameOfLife {',
				'		private gridSize: number;',
				'		private canvasSize: number;',
				'		private lineColor: string;',
				'		private liveColor: string;',
				'		private deadColor: string;',
				'		private initialLifeProbability: number;',
				'		private animationRate: number;',
				'		private cellSize: number;',
				'		private context: CanvasRenderingContext2D;',
				'		private world;',
				'',
				'',
				'		constructor() {',
				'			this.gridSize = 50;',
				'			this.canvasSize = 600;',
				'			this.lineColor = \'#cdcdcd\';',
				'			this.liveColor = \'#666\';',
				'			this.deadColor = \'#eee\';',
				'			this.initialLifeProbability = 0.5;',
				'			this.animationRate = 60;',
				'			this.cellSize = 0;',
				'			this.world = this.createWorld();',
				'			this.circleOfLife();',
				'		}',
				'',
				'		public createWorld() {',
				'			return this.travelWorld( (cell : Cell) =>  {',
				'				cell.live = Math.random() < this.initialLifeProbability;',
				'				return cell;',
				'			});',
				'		}',
				'',
				'		public circleOfLife() : void {',
				'			this.world = this.travelWorld( (cell: Cell) => {',
				'				cell = this.world[cell.row][cell.col];',
				'				this.draw(cell);',
				'				return this.resolveNextGeneration(cell);',
				'			});',
				'			setTimeout( () => {this.circleOfLife()}, this.animationRate);',
				'		}',
				'',
				'		public resolveNextGeneration(cell : Cell) {',
				'			var count = this.countNeighbors(cell);',
				'			var newCell = new Cell(cell.row, cell.col, cell.live);',
				'			if(count < 2 || count > 3) newCell.live = false;',
				'			else if(count == 3) newCell.live = true;',
				'			return newCell;',
				'		}',
				'',
				'		public countNeighbors(cell : Cell) {',
				'			var neighbors = 0;',
				'			for(var row = -1; row <=1; row++) {',
				'				for(var col = -1; col <= 1; col++) {',
				'					if(row == 0 && col == 0) continue;',
				'					if(this.isAlive(cell.row + row, cell.col + col)) {',
				'						neighbors++;',
				'					}',
				'				}',
				'			}',
				'			return neighbors;',
				'		}',
				'',
				'		public isAlive(row : number, col : number) {',
				'			if(row < 0 || col < 0 || row >= this.gridSize || col >= this.gridSize) return false;',
				'			return this.world[row][col].live;',
				'		}',
				'',
				'		public travelWorld(callback) {',
				'			var result = [];',
				'			for(var row = 0; row < this.gridSize; row++) {',
				'				var rowData = [];',
				'				for(var col = 0; col < this.gridSize; col++) {',
				'					rowData.push(callback(new Cell(row, col, false)));',
				'				}',
				'				result.push(rowData);',
				'			}',
				'			return result;',
				'		}',
				'',
				'		public draw(cell : Cell) {',
				'			if(this.context == null) this.context = this.createDrawingContext();',
				'			if(this.cellSize == 0) this.cellSize = this.canvasSize/this.gridSize;',
				'',
				'			this.context.strokeStyle = this.lineColor;',
				'			this.context.strokeRect(cell.row * this.cellSize, cell.col*this.cellSize, this.cellSize, this.cellSize);',
				'			this.context.fillStyle = cell.live ? this.liveColor : this.deadColor;',
				'			this.context.fillRect(cell.row * this.cellSize, cell.col*this.cellSize, this.cellSize, this.cellSize);',
				'		}',
				'',
				'		public createDrawingContext() {',
				'			var canvas = <HTMLCanvasElement> document.getElementById(\'conway-canvas\');',
				'			if(canvas == null) {',
				'					canvas = document.createElement(\'canvas\');',
				'					canvas.id = \'conway-canvas\';',
				'					canvas.width = this.canvasSize;',
				'					canvas.height = this.canvasSize;',
				'					document.body.appendChild(canvas);',
				'			}',
				'			return canvas.getContext(\'2d\');',
				'		}',
				'	}',
				'}',
				'',
				'var game = new Conway.GameOfLife();',

			].join('\n'), 'typescript', new monaco.Uri("model+abc"))
		});
	});
	}, 100);
</script>

Checkout our [API Reference](api/index.html).

```javascript
// Runnable code
console.log("iii");
console.log("abc");
console.log(123);
console.log({a: 2});
console.log(undefined)
console.log(null)
console.log("??")
console.log($)
console.log([]);
console.log({a: [2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6,2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6]});
console.error("123")
console.error("123")
console.error("123")
console.error("123")
console.error("123")

```

```javascript
// Not runnable code
test = i + 1;
nothing.call();
```
