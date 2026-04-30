export default function Featured() {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center min-h-screen px-6 py-12 lg:py-0 bg-white">
      <div className="flex-1 h-[400px] lg:h-[800px] mb-8 lg:mb-0 lg:order-2">
        <img
          src="https://cdn.poehali.dev/projects/5331a76e-fcb1-4ead-a56d-a81ae8d56851/files/948ab1a8-2eb1-4e4b-bdc8-92773d2b6d13.jpg"
          alt="Car tuning garage"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 text-left lg:h-[800px] flex flex-col justify-center lg:mr-12 lg:order-1">
        <h3 className="uppercase mb-4 text-sm tracking-wide text-neutral-500">Тюнинг без ограничений</h3>
        <p className="text-2xl lg:text-4xl mb-8 text-neutral-900 leading-tight">
          Сотни деталей, тысячи комбинаций. Прокачивай двигатель, подвеску и внешний вид — собери авто мечты и докажи, кто здесь хозяин асфальта.
        </p>
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3 text-neutral-700">
            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
            <span>200+ лицензированных автомобилей</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-700">
            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
            <span>Открытый мир — огромный живой город</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-700">
            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
            <span>Онлайн-гонки против реальных игроков</span>
          </div>
        </div>
        <button className="bg-black text-white border border-black px-4 py-2 text-sm transition-all duration-300 hover:bg-orange-500 hover:border-orange-500 cursor-pointer w-fit uppercase tracking-wide">
          Узнать больше
        </button>
      </div>
    </div>
  );
}