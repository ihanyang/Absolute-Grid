<template>
	<div class="grid-wrap">
		<div class="grid" v-style="height: rows * (rangeValue * 286 + 42)  - 42 + 'px';">
			<div class="grid-item" style="background-image: url({{data.url}});" data-index="{{$index}}" v-style="width: rangeValue * 161 + 'px', height: rangeValue * 161 * 286 / 161 + 'px'" v-render="rangeValue" v-redraw="availWidth" v-repeat="data in lists | filterBy filterText in 'name'" v-on="mousedown: dragStart($event, this), mouseup: dragEnd" v-drag-start="this === dragTarget" v-drag-end="dragEndStatus">
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
				lists: require("./data.json"),
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
				sorted: [],
				moveStatus: false
			}
		},
		ready: function () {
			var _this = this

			window.addEventListener("resize", _.throttle(_this.reflow, 200), true)

			document.addEventListener("mousemove", function (e) {
				if (_this.dragTarget) {
					_this.drag(e.clientX, e.clientY)
				}
			}, true)

			document.addEventListener("mouseup", function () {
				_this.dragTarget && (_this.dragEndStatus = true)
			})

			this.$watch("rangeValue", function () {
				//_this.redraw()

				_this.rows = Math.ceil(document.querySelectorAll(".grid-item").length / (Math.floor(_this.availWidth / (_this.rangeValue * 161))))

				// 更新数组
				_this.position.splice(0, 130)
			})

			this.top = document.querySelector(".grid").offsetTop

			this.left = document.querySelector(".grid").offsetLeft

			this.availWidth = document.documentElement.clientWidth - 40 > 1060 ? 1060 : document.documentElement.clientWidth - 40

			this.rows = Math.ceil(this.lists.length / (Math.floor(this.availWidth / (this.rangeValue * 161))))
		},
		watch: {
			"filterText": function (value) {
				var _this = this

				if (! value && this.sorted.length) {
					this.sorted.forEach(function (v, i) {
						document.querySelectorAll(".grid-item")[i].dataset.index = v.index

						document.querySelectorAll(".grid-item")[i].style.transform = "translate3d(" + v.x + "px, " + v.y + "px, 0)"
					})
				} else {
					Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
						v.style.transform = "translate3d(" + _this.redraw(i).x + ", " + _this.redraw(i).y + ", 0)"
					})
				}

				this.rows = Math.ceil(document.querySelectorAll(".grid-item").length / (Math.floor(this.availWidth / (this.rangeValue * 161))))
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
			dragStart: function (e, vm) {
				var _this = this

				this.dragTarget = vm

				this.offsetX = e.clientX - vm.$el.getBoundingClientRect().left
				this.offsetY = e.clientY - vm.$el.getBoundingClientRect().top

				this.position.forEach(function (v) {
					if (vm.$el.style.transform === "translate3d(" + v.x + "px, " + v.y + "px, 0px)") {
						_this.index = v.index
					}
				})

				this.position.forEach(function (v) {
					v.x += _this.left
					v.y += _this.top
				})
			},
			drag: function (coorX, coorY) {
				var x = Math.round(coorX - this.offsetX)
					y = Math.round(coorY - this.offsetY)

					console.log(y)

				if (this.dragTarget.$el.style.position === "absolute") {
					this.dragTarget.$el.style.position = "fixed"

					this.dragTarget.$el.style.top = 0
					this.dragTarget.$el.style.left = 0

					this.dragTarget.$el.style.zIndex = 1000
				}

				this.dragTarget.$el.style.transform = "translate3d(" + x + "px, " + y + "px, 0)"

				_.throttle(this.detect, 200)(x, y)
				//this.detect(x, y)
			},
			detect: function (currentX, currentY) {
				var _this = this
				var ii
				var section = []

				this.position.forEach(function (v, i) {
					if (_this.index !== v.index) {
						if ((Math.abs(currentX - v.x) <= (_this.rangeValue * 161) * 1 / 2 && Math.abs(currentY - v.y) <= (_this.rangeValue * 286) * 1 / 2)) {
							ii = v.index

							if (_this.index < v.index) {
								while (ii > _this.index) {
										
									Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
										if (+ v.dataset.index === ii && ! v.dataset.status) {
											v.style.transform = "translate3d(" + (_this.position[ii - 1].x - _this.left) + "px, " + (_this.position[ii - 1].y - _this.top) + "px, 0px)"

											v.dataset.index = ii - 1

											v.dataset.status = "moved"
										}
									})

									ii--
								}
							} else {
								while (ii < _this.index) {
										
									Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
										if (+ v.dataset.index === ii && ! v.dataset.status) {
											v.style.transform = "translate3d(" + (_this.position[ii + 1].x - _this.left) + "px, " + (_this.position[ii + 1].y - _this.top) + "px, 0px)"

											v.dataset.index = ii + 1

											v.dataset.status = "moved"
										}
									})

									ii++
								}
							}

							Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
								delete v.dataset.status
							})

							_this.value = "translate3d(" + (v.x - _this.left) + "px, " + (v.y - _this.top) + "px, 0)"

							_this.index = v.index
						}
					}
				})
			},
		},
		directives: {
			render: function () {
				var _this = this

				var value = this.el.dataset.index

				var x = this.vm.$parent.redraw(value).x

				var y = this.vm.$parent.redraw(value).y

				this.el.style.transform = "translate3d(" + x + ", " + y + ", 0)"

				this.el.style.position = "absolute"

				setTimeout(function () {
					_this.el.style.transition = "transform 0.3s ease"
				}, 0)

				this.vm.$parent.position.push({
					x: ~~ x.replace("px", ""),
					y: ~~ y.replace("px", ""),
					index: + value
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
				var _this = this

				if (value && this.vm === this.vm.$parent.dragTarget) {
					this.el.style.cssText = this.el.style.cssText.replace(/\spointer.+1000;/, "")

					this.el.style.position = "absolute"

					this.el.style.transform = this.vm.$parent.value

					this.el.dataset.index = this.vm.$parent.index

					setTimeout(function () {
						_this.el.style.transition = "transform 0.3s ease"
					}, 0)

					this.vm.$parent.dragEndStatus = false

					this.vm.$parent.dragTarget = null

					this.vm.$parent.index = 0

					this.vm.$parent.position.forEach(function (v) {
						v.x = v.x - _this.vm.$parent.left
						v.y = v.y - _this.vm.$parent.top
					})

					// 保存排序后的位置
					_this.vm.$parent.sorted = []

					Array.prototype.slice.call(document.querySelectorAll(".grid-item")).forEach(function (v, i) {
						_this.vm.$parent.sorted.push({
							x: v.style.transform.match(/\d+/g)[1],
							y: v.style.transform.match(/\d+/g)[2],
							index: + v.dataset.index
						})
					})
				}
			}
		}
	}
</script>
