export default function CreativitySection() {
  return (
    <section className="bg-white text-black  py-16 px-8 lg:px-48 w-full">
      <div className="relative w-full mx-auto">

        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Heading */}
          <div className="lg:col-span-1">
            <h1 className=" font-bold text-5xl lg:text-7xl leading-tight"><span className="italic text-teal-700">Creativity</span>  <br /> with purpose</h1>
          </div>

          {/* Right Column - Text Content */}
          <div className="lg:col-span-1 mt-4 lg:mt-0">
            <p className="lg:text-lg text-md leading-relaxed">
              At Nova, we're more than just a digital agency—we're a team of creative thinkers, problem solvers, and
              brand builders. Our mission is to craft bold, impactful, and user-driven experiences that help brands
              thrive in the digital world.
            </p>

            <p className="lg:text-lg text-md leading-relaxed mt-4">
              With a deep passion for design and technology, we bridge the gap between aesthetics and functionality,
              ensuring every project we touch delivers real results.
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div className="mt-8 lg:mt-12">
          <div className="lg:ml-auto lg:max-w-1xl">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Creative team working collaboratively in a modern office environment with multiple monitors and design tools"
              className="w-full h-64 lg:h-96 object-cover rounded-xl grayscale"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
