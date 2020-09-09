const initialState = {
  list: [],
}
const entityType = 'product';

const productReducer = (state = initialState, action) => {
    switch (action.type) {
      case "LIST_LOADED":
        if (action.entityType !== entityType) {
          return {...state};
        }
        return {
          ...state,
          list: [...action.payload]
        };
      case "ITEM_LOADED":
        if (action.entityType !== entityType) {
          return {...state};
        }
        return {
          ...state,
          list: [...state.list, ...action.payload]
        };
      default:
        return state;
    }
  };

export default productReducer;