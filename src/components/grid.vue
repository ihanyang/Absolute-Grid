<template>
	<div class="grid-wrap">
		<div class="grid" v-style="height: rows * (rangeValue * 286 + 42)  - 42 + 'px';">
			<div class="grid-item" style="background-image: url({{data.url}});" data-index="{{$index}}" v-style="width: rangeValue * 161 + 'px', height: rangeValue * 161 * 286 / 161 + 'px'" v-render="rangeValue" v-repeat="data in lists | filterBy filterText in 'name'" v-on="mousedown: dragStart($event, this)" v-drag-start="this === dragTarget" v-drag-end="dragEndStatus">
				<span class="grid-text" v-text="data.name"></span>
			</div>
		</div>
	</div>
</template>

<script>
	var _ = require("underscore")

	module.exports = {
		props: ["filterText", "rangeValue"],
		data: function () {
			return {
				lists: require("../data.json"),
				position: [],
				offsetX: 0,
				offsetY: 0,
				value: "",
				dragTarget: null,
				dragEndStatus: false,
				top: 0,
				left: 0,
				target: null,
				index: 0,
				availWidth: 0,
				rows: 0,
				moveStatus: false
			}
		},
		ready: function () {
			window.addEventListener("resize", _.throttle(this.reflow, 200), true)

			document.addEventListener("mousemove", function (e) {
				if (this.dragTarget) {
					this.drag(e.clientX, e.clientY)
				}
			}.bind(this), true)

			document.addEventListener("mouseup", function () {
				this.dragTarget && (this.dragEndStatus = true)
			}.bind(this))

			this.top = document.querySelector(".grid").offsetTop

			this.left = document.querySelector(".grid").offsetLeft

			this.availWidth = document.documentElement.clientWidth - 40 > 1060 ? 1060 : document.documentElement.clientWidth - 40

			this.rows = Math.ceil(this.lists.length / (Math.floor(this.availWidth / (this.rangeValue * 161))))
		},
		watch: {
			"rangeValue": function () {
				this.rows = Math.ceil(document.querySelectorAll(".grid-item").length / (Math.floor(this.availWidth / (this.rangeValue * 161))))

				this.updatePosition()
			},
			"filterText": function (value) {
				this.updatePosition()

				this.rows = Math.ceil(document.querySelectorAll(".grid-item").length / (Math.floor(this.availWidth / (this.rangeValue * 161))))
			},
			availWidth: function () {
				this.updatePosition()
			}
		},
		methods: {
			redraw: function (order) {
				this.availWidth = document.documentElement.clientWidth - 40 > 1060 ? 1060 : document.documentElement.clientWidth - 40

				this.rows = Math.ceil(this.lists.length / (Math.floor(this.availWidth / (this.rangeValue * 161))))

				var availWidth = this.availWidth

				var width = this.rangeValue * 161

				var value = order

				var length = Math.floor(availWidth / width)

				var index = value - (Math.floor(value / length) * length)

				var x = Math.round(index * width + (index * ((availWidth - width *  length) / (length - 1)))) + "px"

				var y = Math.round(Math.floor(value / length) * (286 * width / 161 + 42)) + "px"

				return {
					x: x,
					y: y
				}
			},
			reflow: function () {
				this.availWidth = document.documentElement.clientWidth - 40 > 1060 ? 1060 : document.documentElement.clientWidth - 40
			},
			updatePosition: function () {
				this.position = []

				Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
					x = this.redraw(+ v.dataset.index).x
					y = this.redraw(+ v.dataset.index).y

					v.style.transform = "translate3d(" + x + ", " + y + ", 0)"

					this.position.push({
						x: ~~ x.replace("px", ""),
						y: ~~ y.replace("px", ""),
						index: + v.dataset.index
					})
				}.bind(this))
			},
			dragStart: function (e, vm) {
				this.dragTarget = vm

				this.offsetX = e.clientX - vm.$el.getBoundingClientRect().left
				this.offsetY = e.clientY - vm.$el.getBoundingClientRect().top

				this.position.forEach(function (v) {
					if (vm.$el.style.transform === "translate3d(" + v.x + "px, " + v.y + "px, 0px)") {
						this.index = v.index
					}
				}.bind(this))
			},
			drag: function (coorX, coorY) {
				var x = Math.round(coorX - this.offsetX)
					y = Math.round(coorY - this.offsetY)

				if (this.dragTarget.$el.style.position === "absolute") {
					this.dragTarget.$el.style.position = "fixed"

					this.dragTarget.$el.style.top = 0
					this.dragTarget.$el.style.left = 0

					this.dragTarget.$el.style.zIndex = 1000
				}

				this.dragTarget.$el.style.transform = "translate3d(" + x + "px, " + y + "px, 0)"

				_.throttle(this.detect, 200)(x - this.left, y - this.top)
			},
			detect: function (currentX, currentY) {
				var ii
				var section = []

				currentY += document.body.scrollTop

				this.position.forEach(function (v, i) {
					if (this.index !== v.index) {
						if ((Math.abs(currentX - v.x) <= (this.rangeValue * 161) * 1 / 2 && Math.abs(currentY - v.y) <= (this.rangeValue * 286) * 1 / 2)) {
							ii = v.index

								if (this.index < v.index) {
									while (ii > this.index) {
										
										Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
											if (+ v.dataset.index === ii && ! v.dataset.status) {
												v.style.transform = "translate3d(" + (this.position[ii - 1].x) + "px, " + (this.position[ii - 1].y) + "px, 0px)"

												v.dataset.index = ii - 1

												v.dataset.status = "moved"
											}
										}.bind(this))

										ii--
									}
								} else {
									while (ii < this.index) {
										
										Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
											if (+ v.dataset.index === ii && ! v.dataset.status) {
												v.style.transform = "translate3d(" + (this.position[ii + 1].x) + "px, " + (this.position[ii + 1].y) + "px, 0px)"

												v.dataset.index = ii + 1

												v.dataset.status = "moved"
											}
										}.bind(this))

										ii++
									}
								}

								Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
									delete v.dataset.status
								})

							 	this.value = "translate3d(" + v.x + "px, " + v.y + "px, 0)"

							 	this.dragTarget.$el.dataset.index = v.index

							 	this.index = v.index
						}
					}
				}.bind(this))
			}
		},
		directives: {
			render: function (changed, previous) {
				var value = + this.el.dataset.index

				var x = this.vm.$parent.redraw(value).x

				var y = this.vm.$parent.redraw(value).y

				this.el.style.transform = "translate3d(" + x + ", " + y + ", 0)"

				this.el.style.position = "absolute"

				setTimeout(function () {
					this.el.style.transition = "transform 0.3s ease"
				}.bind(this), 0)

				this.vm.$parent.position.push({
					x: ~~ x.replace("px", ""),
					y: ~~ y.replace("px", ""),
					index: value
				})
			},
			redraw: function () {
				var value = + this.el.dataset.index

				var x = this.vm.$parent.redraw(value).x

				var y = this.vm.$parent.redraw(value).y

				this.el.style.transform = "translate3d(" + x + ", " + y + ", 0)"
			},
			"drag-start": function (value) {
				if (value) {
					this.el.style.transition = "none"
					this.el.style["pointer-events"] = "none"
					
					this.vm.$parent.value = this.el.style.transform
				}
			},
			"drag-end": function (value) {
				if (value && this.vm === this.vm.$parent.dragTarget) {
					this.el.style.cssText = this.el.style.cssText.replace(/\spointer.+1000;/, "")

					this.el.style.position = "absolute"

					this.el.style.transform = this.vm.$parent.value

					this.el.dataset.index = this.vm.$parent.index

					setTimeout(function () {
						this.el.style.transition = "transform 0.3s ease"
					}.bind(this), 0)

					this.vm.$parent.dragEndStatus = false

					this.vm.$parent.dragTarget = null

					this.vm.$parent.index = 0
				}
			}
		}
	}
</script>