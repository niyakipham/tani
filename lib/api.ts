export const fetchMovies = async (page = 1) => {
  const res = await fetch(`https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=${page}`);
  return res.json();
};

export const fetchMovieDetails = async (slug: string) => {
  const res = await fetch(`https://ophim1.com/phim/${slug}`);
  return res.json();
};

export const searchMovies = async (keyword: string, page = 1) => {
  const res = await fetch(`https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  return res.json();
};

export const fetchMoviesByGenre = async (genre: string, page = 1) => {
  const res = await fetch(`https://ophim1.com/v1/api/the-loai/${genre}?page=${page}`);
  return res.json();
};
