import React, { useState, useEffect } from 'react';
import './App.css';
import KanbanDB from 'kanbandb/dist/KanbanDB';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddButton from './Components/AddButton/Add';

function initialize() {
  KanbanDB.connect();
}

function App() {
  const [columns, setColumns] = useState({
    todo: {
      title: 'To-do',
      items: [],
    },
    doing: {
      title: 'In Progress',
      items: [],
    },
    done: {
      title: 'Done',
      items: [],
    },
  });
  
  const initalCards = [
  ];

  const [data, setData] = useState(initalCards);
  useEffect(() => {
    initialize();
    KanbanDB.getCards()
      .then((cards) => {
        setData(cards);
        Object.entries(columns).map(([columnName, column]) => {
          cards.map((card) => {
            if (columnName === card.status.toLowerCase()) {
              setColumns((prevState) => ({
                ...prevState,
                [columnName]: {
                  ...prevState[columnName],
                  items: [...prevState[columnName].items, card],
                },
              }));
            }
          });
        });
      })
      .catch((err) => console.error(err.message));
  }, );

  const handleDragEnd = ({ destination, source }) => {
    if (!destination) {
      return;
    }
    const itemCopy = { ...columns[source.droppableId].items[source.index] };
    setColumns((prev) => {
      prev = { ...prev };
      prev[source.droppableId].items.splice(source.index, 1);
      prev[destination.droppableId].items.splice(
        destination.index,
        0,
        itemCopy
      );
      return prev;
    });
  };

  const handleDelete = (id, status, index) => {
    const answer = window.confirm("are you sure you want to delete the card?");
    if (answer) {
      KanbanDB.deleteCardById(id).then((card) => {
        setColumns((prev) => {
          prev = { ...prev };
          prev[status.toLowerCase()].items.splice(index, 1);
          return prev;
        });
      });
    }
  };

  const addCard = (newCard) => {
    if (!newCard.name) {
      return;
    }
    KanbanDB.addCard(newCard)
      .then((cardId) => {
        KanbanDB.getCardById(cardId).then((card) => {
          setColumns((prev) => {
            prev = { ...prev };
            prev[card.status.toLowerCase()].items.push(card);
            return prev;
          });
        });
      })

      .catch((err) => console.error(err.message));
  };


  return (
    <div className='App'>
      <div className="columns-container">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(columns).map(([columnName, column]) => {
          return (
            <div key={columnName} className='column-container'>
              <h3>
                {column.title}
              </h3>
              <Droppable droppableId={columnName} key={columnName}>
                {(provided, snapshot) => {
                  return (
                    <div
                      ref={provided.innerRef}
                      className='column-container'
                      {...provided.droppableProps}
                    >
                      {columns[columnName].items.map((card, index) => {
                        return (
                          <Draggable
                            key={card.id}
                            index={index}
                            draggableId={card.id}
                          >
                            {(provided, snapshot) => {
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className='card' onClick={() => handleDelete(
                                    card.id,
                                    card.status,
                                    index
                                  )}>
                                  <div>
                                    <div>{card.name}</div>
                                  </div>
                                  <div>
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
      </div>
      <AddButton addItem={addCard} />
    </div>
  );
}

export default App;