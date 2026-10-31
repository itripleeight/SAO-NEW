import React from 'react';

const MenuItemCard = ({ item }) => {
  const { name, description, image } = item || {};

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="font-serif text-xl font-medium text-neutral-900">{name}</h3>
        </div>
        <p className="text-neutral-700 text-sm flex-grow">{description}</p>
      </div>
    </div>
  );
};

export default MenuItemCard;
