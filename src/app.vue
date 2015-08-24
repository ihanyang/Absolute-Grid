<template>
	<div class="wrap">
		<h1 class="title">Absolute Grid</h1>
		<p class="desc">
			Sortable, filterable, zoomable, ReactJS grid component using an absolute transform3d layout for React 0.13.x and ES6.
			<a href="#">Read more here</a>
		</p>
		<div class="operation">
			<input type="text" class="filter" placeholder="filter eg: login" v-model="filterValue" />
			<input type="range" min="0.5" max="1.5" step="0.1" v-model="range" />
		</div>
		<grid filter-text="{{filterValue}}" range-value="{{range}}"></grid>
	</div>
</template>

<script>
	module.exports = {
		data: function () {
			return {
				filterValue: "",
				range: 1
			}
		},
		components: {
			"grid": require("./components/grid.vue")
		}
	}
</script>
