export default function ExperienceSection() {
  const features = [
    {
      title: "Client-centric approach",
      description: "Your vision is our priority",
      icon: (
        <svg className="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="currentColor">
          <g>
            <path d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z" />
          </g>
        </svg>
      ),
    },
    {
      title: "Cutting-edge design",
      description: "Modern, sleek, and user-focused solutions",
      icon: (
        <svg className="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      title: "Results-driven strategy",
      description: "Creativity meets performance",
      icon: (
        <svg className="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      ),
    },
    {
      title: "Global experience",
      description: "Trusted by brands worldwide",
      icon: (
        <svg className="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-black py-20 px-8 lg:px-24 w-full">
      <div className="max-w-6xl mx-auto text-center">
        {/* Top Decorative Icon */}
        <div className="flex justify-center mb-8">
          <svg className="w-10 h-10 text-lime-400" viewBox="0 0 100 100" fill="currentColor">
            <g>
              <rect x="47" y="10" width="6" height="80" />
              <rect x="10" y="47" width="80" height="6" />
              <rect x="47" y="10" width="6" height="80" transform="rotate(45 50 50)" />
              <rect x="47" y="10" width="6" height="80" transform="rotate(-45 50 50)" />
              <rect x="47" y="20" width="6" height="60" transform="rotate(22.5 50 50)" />
              <rect x="47" y="20" width="6" height="60" transform="rotate(-22.5 50 50)" />
              <rect x="47" y="20" width="6" height="60" transform="rotate(67.5 50 50)" />
              <rect x="47" y="20" width="6" height="60" transform="rotate(-67.5 50 50)" />
            </g>
          </svg>
        </div>

        {/* Heading Area */}
        <div className="mb-16">
          {/* Main Title */}
          <h1 className="text-white font-bold text-3xl lg:text-5xl text-center mb-4">We don't just design</h1>

          {/* Subtitle with Highlighted Words */}
          <p className="text-gray-300 text-lg text-center mt-4">
            we create experiences that <span className="text-lime-400 font-medium">connect</span>,{" "}
            <span className="text-lime-400 font-medium">inspire</span>, and{" "}
            <span className="text-lime-400 font-medium">convert</span>
          </p>
        </div>

        {/* Feature Icons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-16 text-center">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Icon */}
              <div className="mb-4">{feature.icon}</div>

              {/* Title */}
              <h3 className="font-semibold text-base mb-1 text-white">{feature.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
