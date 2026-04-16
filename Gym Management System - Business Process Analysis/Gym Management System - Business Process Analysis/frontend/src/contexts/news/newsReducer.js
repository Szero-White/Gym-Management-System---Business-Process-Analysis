import {
  GET_NEWS,
  GET_NEWS_DETAIL,
  ADD_NEWS,
  UPDATE_NEWS,
  DELETE_NEWS,
  TOGGLE_FEATURED,
  TOGGLE_ACTIVE,
  NEWS_ERROR,
  CLEAR_NEWS,
  SET_LOADING
} from './types';

const newsReducer = (state, action) => {
  switch (action.type) {
    case GET_NEWS:
      return {
        ...state,
        news: action.payload,
        loading: false,
        error: null
      };
    case GET_NEWS_DETAIL:
      return {
        ...state,
        currentNews: action.payload,
        loading: false,
        error: null
      };
    case ADD_NEWS:
      return {
        ...state,
        news: [action.payload, ...(state.news || [])],
        loading: false,
        error: null
      };
    case UPDATE_NEWS:
    case TOGGLE_FEATURED:
    case TOGGLE_ACTIVE:
      return {
        ...state,
        news: state.news ? 
          state.news.map(item => 
            item._id === action.payload._id ? action.payload : item
          ) : 
          [action.payload],
        currentNews: action.payload,
        loading: false,
        error: null
      };
    case DELETE_NEWS:
      return {
        ...state,
        news: state.news ? 
          state.news.filter(item => item._id !== action.payload) : 
          [],
        loading: false,
        error: null
      };
    case NEWS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case CLEAR_NEWS:
      return {
        ...state,
        currentNews: null,
        error: null
      };
    case SET_LOADING:
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
};

export default newsReducer;