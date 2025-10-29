import { styled } from '@mui/material/styles';
import { Box, Card, TableContainer, Table, TableCell, TableHead } from '@mui/material';

export const StyledContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    maxWidth: '1200px',
    margin: '0 auto',
}));

export const StyledCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    maxHeight: 400,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
})) as typeof TableContainer;

export const StyledTable = styled(Table)(({ theme }) => ({
    '& .MuiTableCell-root': {
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1.5, 2),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : theme.palette.grey[50],
        fontWeight: 600,
        borderBottom: `2px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: theme.palette.action.hover,
    },
})) as typeof Table;

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5, 2),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
    '&:first-of-type': {
        paddingLeft: theme.spacing(3),
    },
    '&:last-of-type': {
        paddingRight: theme.spacing(3),
    },
}));

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
    '& .MuiTableCell-root': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : theme.palette.grey[50],
        fontWeight: 600,
        borderBottom: `2px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
    },
}));
