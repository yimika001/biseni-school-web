const Gallery = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-primary border-b-4 border-accent inline-block mb-8 uppercase">School Gallery</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map(img => (
          <div key={img} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold border">
            Photo {img}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Gallery;