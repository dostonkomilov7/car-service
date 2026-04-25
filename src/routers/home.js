const services = [
  { slug: 'oil-change',    title: 'Oil Change',         price: 'From $49',  description: 'Full synthetic or conventional oil swap with filter replacement and 21-point inspection.' },
  { slug: 'tyre',          title: 'Tyre Service',        price: 'From $35',  description: 'Rotation, balancing, alignment checks, and new tyre fitting for all vehicle types.' },
  { slug: 'brakes',        title: 'Brake Repair',        price: 'From $120', description: 'Pad and rotor replacement, brake fluid flush, caliper service, and full safety check.' },
  { slug: 'diagnostics',   title: 'Engine Diagnostics',  price: 'From $79',  description: 'OBD-II scan, fault code reading, and full report with recommended repairs.' },
  { slug: 'ac',            title: 'AC Service',          price: 'From $95',  description: 'Refrigerant recharge, leak detection, compressor check, and cabin filter replacement.' },
  { slug: 'battery',       title: 'Battery & Electrical',price: 'From $55',  description: 'Battery testing, replacement, alternator and starter checks, and wiring diagnostics.' },
  { slug: 'full',          title: 'Full Service',        price: 'From $199', description: 'Comprehensive 60-point inspection covering engine, brakes, fluids, tyres, lights, and more.' },
  { slug: 'transmission',  title: 'Transmission',        price: 'From $150', description: 'Fluid change, filter service, gear shift adjustments, and auto/manual transmission repairs.' },
];

router.get('/', (req, res) => {
  res.render('home', { services });
});