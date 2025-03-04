import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

export default function withDragDropContext(Component) {
  return DragDropContext(HTML5Backend)(Component);
}
